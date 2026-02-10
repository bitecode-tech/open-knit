package bitecode.modules.wallet;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules.wallet._config.WalletIntegrationTest;
import bitecode.modules.wallet.model.command.AddWalletAssetCommand;
import bitecode.modules.wallet.model.command.CreateWalletAssetCommand;
import bitecode.modules.wallet.model.command.SubtractWalletAssetCommand;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class WalletEventHandlerTest extends WalletIntegrationTest {

    @Autowired
    WalletRepository walletRepository;
    @Autowired
    WalletAssetEventRepository walletAssetEventRepository;
    @Autowired
    WalletAssetEventHandler walletAssetEventHandler;
    @Autowired
    ApplicationEventPublisher eventPublisher;

    @Test
    @Transactional
    public void shouldCreateNewWalletWithWalletAsset(){
        // given
        var userId = UUID.randomUUID().toString();
        var newWalletAssetEvent = CreateWalletAssetCommand.builder()
                .amount(BigDecimal.valueOf(123.329))
                .currency("DUMMY_CURRENCY")
                .referenceId("referenceId")
                .userId(userId)
                .build();

        // when
        walletAssetEventHandler.handle(newWalletAssetEvent);

        // then
        var userWallet = walletRepository.findOneByUserId(userId).get();
        var walletAssets = userWallet.getAssets();
        assertThat(walletAssets.size(), is(1));

        var walletAsset = walletAssets.getFirst();

        assertThat(walletAsset, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("totalAmount", comparesEqualTo(BigDecimal.ZERO)),
                hasProperty("holdAmount", comparesEqualTo(BigDecimal.ZERO)),
                hasProperty("name", is("DUMMY_CURRENCY"))
        ));

        var events = walletAssetEventRepository.findAllByWalletAssetId(walletAsset.getId());
        assertThat(events.size(), is(1));
        var event = events.getFirst();
        assertThat(event.getEventData(), equalTo(newWalletAssetEvent));
    }

    @Test
    @Transactional
    public void shouldFailToSubtractBelow0(){
        //given
        var userId = UUID.randomUUID().toString();
        var subtractEvent = SubtractWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(15))
                .build();
        // when
        var exception = assertThrows(UnappliedCommandException.class, () -> eventPublisher.publishEvent(subtractEvent));
        // then
        assertThat(exception.getMessage(), is("Not enough money"));
    }

    @Test
    @Transactional
    public void shouldFailToSubtractBelow0UsingEventListener(){
        //given
        var userId = UUID.randomUUID().toString();
        var subtractEvent = SubtractWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(15))
                .build();
        // when
        var exception = assertThrows(UnappliedCommandException.class, () -> walletAssetEventHandler.handle(subtractEvent));
        // then
        assertThat(exception.getMessage(), is("Not enough money"));
    }

    @Test
    @Transactional
    public void shouldProperlySubtractToZero(){
        // given
        var userId = UUID.randomUUID().toString();
        var addEvent = AddWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(15))
                .build();
        var subtractEvent = SubtractWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(15))
                .build();
        // when
        Stream.of(addEvent, subtractEvent).forEach(walletAssetEventHandler::handle);

        // then
        var userWallet = walletRepository.findOneByUserId(userId).get();
        var walletAssets = userWallet.getAssets();
        assertThat(walletAssets.size(), is(1));

        var walletAsset = walletAssets.getFirst();

        assertThat(walletAsset, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("totalAmount", comparesEqualTo(BigDecimal.ZERO)),
                hasProperty("holdAmount", comparesEqualTo(BigDecimal.ZERO)),
                hasProperty("name", is("DUMMY_CURRENCY"))
        ));

        var events = walletAssetEventRepository.findAllByWalletAssetId(walletAsset.getId());
        assertThat(events.size(), is(3));
        assertThat(events.getFirst().getEventData().getClass(), is(CreateWalletAssetCommand.class));
        var persistedAddEvent = events.get(1).getEventData();
        var persistedSubtractEvent = events.get(2).getEventData();
        assertThat(persistedAddEvent, equalTo(addEvent));
        assertThat(persistedSubtractEvent, equalTo(subtractEvent));
    }

    @Test
    @Transactional
    public void shouldProperlyEvaluateOperationsAndCreateNewWalletWithAssets(){
        // given
        var userId = UUID.randomUUID().toString();
        var addEvent1 = AddWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(15))
                .build();
        var addEvent2 = AddWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(33.377))
                .build();
        var subtractEvent = SubtractWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(4))
                .build();
        var addEvent3 = AddWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY_2")
                .amount(BigDecimal.valueOf(1234.8764))
                .build();
        var addEvent4 = AddWalletAssetCommand.builder()
                .userId(userId)
                .currency("DUMMY_CURRENCY")
                .amount(BigDecimal.valueOf(2345.5))
                .build();

        // when
        Stream.of(addEvent1, addEvent2, subtractEvent, addEvent3, addEvent4).forEach(walletAssetEventHandler::handle);

        // then
        var userWallet = walletRepository.findOneByUserId(userId).get();
        var walletAssets = userWallet.getAssets();
        assertThat(walletAssets.size(), is(2));

        var dummyCurrencyAsset = walletAssets.stream().filter(asset -> asset.getName().equals("DUMMY_CURRENCY")).findFirst().get();
        assertThat(dummyCurrencyAsset, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("totalAmount", comparesEqualTo(BigDecimal.valueOf(2389.88))),
                hasProperty("holdAmount", comparesEqualTo(BigDecimal.ZERO)),
                hasProperty("name", is("DUMMY_CURRENCY"))
        ));

        var dummyAssetEvents = walletAssetEventRepository.findAllByWalletAssetId(dummyCurrencyAsset.getId());
        assertThat(dummyAssetEvents.size(), is(5));
        assertThat(dummyAssetEvents.getFirst().getEventData().getClass(), is(CreateWalletAssetCommand.class));
        assertThat(dummyAssetEvents.get(1).getEventData(), equalTo(addEvent1));
        assertThat(dummyAssetEvents.get(2).getEventData(), equalTo(addEvent2));
        assertThat(dummyAssetEvents.get(3).getEventData(), equalTo(subtractEvent));
        assertThat(dummyAssetEvents.get(4).getEventData(), equalTo(addEvent4));

        var dummyCurrency2Asset = walletAssets.stream().filter(asset -> asset.getName().equals("DUMMY_CURRENCY_2")).findFirst().get();
        assertThat(dummyCurrency2Asset, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("totalAmount", comparesEqualTo(BigDecimal.valueOf(1234.88))),
                hasProperty("holdAmount", comparesEqualTo(BigDecimal.ZERO)),
                hasProperty("name", is("DUMMY_CURRENCY_2"))
        ));

        var dummyAsset2Events = walletAssetEventRepository.findAllByWalletAssetId(dummyCurrency2Asset.getId());
        assertThat(dummyAsset2Events.size(), is(2));
        assertThat(dummyAsset2Events.getFirst().getEventData().getClass(), is(CreateWalletAssetCommand.class));
        assertThat(dummyAsset2Events.get(1).getEventData(), equalTo(addEvent1));
    }
}
